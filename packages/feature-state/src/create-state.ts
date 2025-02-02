import type { TListener, TListenerQueueItem, TState } from './types';

const GLOBAL_LISTENER_QUEUE: TListenerQueueItem[] = [];
export const SET_SOURCE_KEY = 'set';

export function createState<GValue>(
	initialValue: GValue,
	options: TCreateStateOptions = {}
): TState<GValue, ['base']> {
	const { deferred = false } = options;

	return {
		_: null,
		_features: ['base'],
		_listeners: [],
		_v: initialValue,
		_notify(notifyOptions = {}) {
			const {
				processListenerQueue = true,
				additionalData = {},
				deferred: innerDeferred = deferred,
				prevValue
			} = notifyOptions;

			// Push current state's listeners to the queue
			for (const listener of this._listeners) {
				if (
					listener.callIf == null ||
					listener.callIf({ newValue: this._v, prevValue, additionalData })
				) {
					GLOBAL_LISTENER_QUEUE.push({
						data: {
							...additionalData,
							value: this._v as Readonly<GValue>
						},
						callback: listener.callback,
						level: listener.level
					});
				}
			}

			// Process queue
			if (processListenerQueue) {
				// Defer processing using setTimeout()
				innerDeferred
					? setTimeout(() => {
							void processQueue();
						})
					: void processQueue();
			}
		},
		get() {
			return this._v;
		},
		set(newValueOrUpdater, setOptions = {}) {
			const newValue =
				typeof newValueOrUpdater === 'function'
					? (newValueOrUpdater as (value: GValue) => GValue)(this._v)
					: newValueOrUpdater;
			const prevValue = this._v;
			if (prevValue !== newValue) {
				const { additionalData = {}, processListenerQueue = true } = setOptions;
				additionalData.source = additionalData.source ?? SET_SOURCE_KEY;
				this._v = newValue;
				this._notify({
					additionalData,
					processListenerQueue,
					prevValue
				});
			}
		},
		listen(callback, listenOptions = {}) {
			const { level = 0, key, callIf } = listenOptions;
			const listener: TListener<GValue> = {
				key,
				level,
				callback,
				callIf
			};
			this._listeners.push(listener);

			// Undbind
			return () => {
				const index = this._listeners.indexOf(listener);
				if (index !== -1) {
					this._listeners.splice(index, 1);
				}
			};
		},
		subscribe(callback, subscribeOptions) {
			const unbind = this.listen(callback, subscribeOptions);
			void callback({ value: this._v });
			return unbind;
		}
	};
}

export interface TCreateStateOptions {
	deferred?: boolean;
}

async function processQueue(): Promise<void> {
	// Drain the queue
	const queueToProcess = GLOBAL_LISTENER_QUEUE.splice(0, GLOBAL_LISTENER_QUEUE.length);
	queueToProcess.sort((a, b) => a.level - b.level);

	// Process each item in the queue sequentially
	for (const queueItem of queueToProcess) {
		await queueItem.callback(queueItem.data);
	}
}
