import type { TEnforceFeatures, TFeatureKeys, TSelectFeatures, TState } from '../types';

export function withUndo<GValue, GSelectedFeatureKeys extends TFeatureKeys<GValue>[]>(
	state: TState<GValue, TEnforceFeatures<GSelectedFeatureKeys, ['base']>>,
	historyLimit = 50
): TState<GValue, ['undo', ...GSelectedFeatureKeys]> {
	const undoFeature: TSelectFeatures<GValue, ['undo']> = {
		_history: [state._v],
		undo(this: TState<GValue, ['undo']>, options) {
			if (this._history.length > 1) {
				this._history.pop(); // Pop current value
				const newValue = this._history.pop(); // Pop previous value
				if (newValue != null) {
					this.set(newValue, options);
				}
			}
		}
	};

	// Merge existing features from the state with the new undo feature
	const _state = Object.assign(state, undoFeature) as unknown as TState<GValue, ['undo', 'base']>;
	_state._features.push('undo');

	_state.listen(
		({ value }) => {
			// Maintaining the history stack size
			if (_state._history.length >= historyLimit) {
				_state._history.shift(); // Remove oldest state
			}

			_state._history.push(value);
		},
		{ key: 'with-undo' }
	);

	return _state as unknown as TState<GValue, ['undo', ...GSelectedFeatureKeys]>;
}
