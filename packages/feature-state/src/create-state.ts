import type { TListener, TListenerQueueItem, TState } from './types';

const LISTENER_QUEUE: TListenerQueueItem[] = [];

export function createState<GValue>(value: GValue, deferred = true): TState<GValue, ['base']> {
	return {
		_: null,
		_features: ['base'],
		_listeners: [],
		_value: value,
		get() {
			return this._value;
		},
		set(newValue, process = true) {
			if (this._value !== newValue) {
				this._value = newValue;
				this._notify(process);
			}
		},
		listen(callback, level) {
			const listener: TListener<GValue, ['base']> = {
				callback,
				level: level ?? 0
			};
			this._listeners.push(listener);

			// Undbind
			return () => {
				const index = this._listeners.indexOf(listener);
				// eslint-disable-next-line no-bitwise -- .
				if (~index) {
					this._listeners.splice(index, 1);
				}
			};
		},
		subscribe(callback, level) {
			const unbind = this.listen(callback, level);
			void callback(this._value, this);
			return unbind;
		},
		_notify(process) {
			// Add current state's listeners to the queue
			this._listeners.forEach((listener) => {
				const queueItem: TListenerQueueItem<GValue> = {
					value: this._value,
					...listener
				};
				LISTENER_QUEUE.push(queueItem);
			});

			// Process queue
			if (process) {
				// Defer processing using setTimeout
				deferred
					? setTimeout(() => {
							void processQueue(this);
						})
					: void processQueue(this);
			}
		}
	};
}

async function processQueue<GValue>(state: TState<GValue, ['base']>): Promise<void> {
	// Drain the queue
	const queueToProcess = LISTENER_QUEUE.splice(0, LISTENER_QUEUE.length);
	queueToProcess.sort((a, b) => a.level - b.level);

	// Process each item in the queue sequentially
	for (const queueItem of queueToProcess) {
		await queueItem.callback(queueItem.value, state);
	}
}
