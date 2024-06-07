import type { TListener, TListenerQueueItem, TReadonlyIfObject, TState } from './types';

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
		set(newValue) {
			if (this._value !== newValue) {
				this._value = newValue;
				this._notify(true);
			}
		},
		listen(callback, level) {
			const listener: TListener<GValue> = {
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
			callback(this._value as TReadonlyIfObject<GValue>);
			return unbind;
		},
		_notify(process) {
			// Add current state's listeners to the queue
			this._listeners.forEach((listener) => {
				const queueItem: TListenerQueueItem<GValue> = {
					value: this._value,
					...listener
				};
				LISTENER_QUEUE.push(queueItem as TListenerQueueItem);
			});

			// Process queue
			if (process) {
				// Defer processing using setTimeout
				deferred ? setTimeout(processQueue) : processQueue();
			}
		}
	};
}

function processQueue(): void {
	// Drain the queue
	const queueToProcess = LISTENER_QUEUE.splice(0, LISTENER_QUEUE.length);

	// Sort the drained listeners by level and execute the callbacks
	queueToProcess
		.sort((a, b) => a.level - b.level)
		.forEach((queueItem) => {
			queueItem.callback(queueItem.value);
		});
}
