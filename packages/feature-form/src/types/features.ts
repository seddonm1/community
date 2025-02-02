import type { TUnionToIntersection } from '@blgc/types/utils';
import { type TFormData } from './form';

export type TFeatures<GFormData extends TFormData = TFormData> = {
	base: { _: null }; // TODO: Placeholder Feature: Figure out how to make the TS infer work with [] (empty array -> no feature)
} & TThirdPartyFeatures<GFormData>;

// Global registry for third party features

export interface TThirdPartyFeatures<GFormData> {}

export type TFeatureKeys<GFormData extends TFormData = TFormData> = keyof TFeatures<GFormData>;

export type TSelectFeatureObjects<
	GFormData extends TFormData,
	GSelectedFeatureKeys extends TFeatureKeys[]
> = {
	[K in GSelectedFeatureKeys[number]]: TFeatures<GFormData>[K];
};

export type TSelectFeatures<
	GFormData extends TFormData,
	GSelectedFeatureKeys extends TFeatureKeys[],
	GSelectedFeatureObjects extends TSelectFeatureObjects<
		GFormData,
		GSelectedFeatureKeys
	> = TSelectFeatureObjects<GFormData, GSelectedFeatureKeys>
> = TUnionToIntersection<GSelectedFeatureObjects[keyof GSelectedFeatureObjects]>;

export type TEnforceFeatures<
	GFeatureKeys extends TFeatureKeys[],
	GToEnforceFeatureKeys extends TFeatureKeys[]
> =
	Exclude<GToEnforceFeatureKeys[number], GFeatureKeys[number]> extends never
		? GFeatureKeys
		: GFeatureKeys | GToEnforceFeatureKeys;
