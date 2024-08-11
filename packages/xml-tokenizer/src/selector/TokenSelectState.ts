import { getQName } from '../get-q-name';
import { type TTokenSelectPathPart } from './types';

export class TokenSelectState {
	private _part: TTokenSelectPathPart;
	private _matchCriteria: ETokenMatchCriteria = ETokenMatchCriteria.None;
	private _toCacheNodeProps: EToCacheNodeProps = EToCacheNodeProps.None;
	private _enteredDepth: number | null = null;

	constructor(part: TTokenSelectPathPart) {
		this._part = part;
		this.applyLevels();
	}

	public get matchCriteria(): ETokenMatchCriteria {
		return this._matchCriteria;
	}

	public get toCacheNodeProps(): EToCacheNodeProps {
		return this._toCacheNodeProps;
	}

	public get enteredDepth(): number | null {
		return this._enteredDepth;
	}

	private applyLevels(): void {
		let matchCriteria = ETokenMatchCriteria.None;
		let cacheProps = EToCacheNodeProps.None;

		if (this._part.local != null || this._part.prefix != null) {
			matchCriteria |= ETokenMatchCriteria.Name;
		}
		if (this._part.attributes != null) {
			matchCriteria |= ETokenMatchCriteria.Attributes;
			cacheProps |= EToCacheNodeProps.Attributes;
		}
		if (this._part.textContains != null) {
			matchCriteria |= ETokenMatchCriteria.Text;
		}
		if (this._part.predicate != null) {
			matchCriteria |= ETokenMatchCriteria.Node;
			cacheProps |= EToCacheNodeProps.Name | EToCacheNodeProps.Attributes | EToCacheNodeProps.Text;
		}

		this._matchCriteria = matchCriteria;
		this._toCacheNodeProps = cacheProps;
	}

	public matchesName(local: string, prefix: string): boolean {
		return (
			// Match local
			(this._part.local == null || this._part.local === '*' || this._part.local === local) &&
			// Match prefix
			(this._part.prefix == null || this._part.prefix === prefix)
		);
	}

	public matchesAttributes(attributes: Record<string, string>): boolean {
		if (this._part.attributes != null) {
			for (const attribute of this._part.attributes) {
				const qName = getQName(attribute.local, attribute.prefix);
				if (
					!(qName in attributes) ||
					(attribute.value != null && attributes[qName] !== attribute.value)
				) {
					return false;
				}
			}
		}
		return true;
	}

	public matchesText(text: string): boolean {
		return this._part.textContains == null || text.includes(this._part.textContains);
	}

	public matchesDepth(depth: number, parentDepth: number): boolean {
		switch (this._part.axis) {
			case 'child':
				return depth === parentDepth + 1;
			case 'self-or-descendant':
				return depth >= parentDepth;
		}
	}

	public match(depth: number): void {
		this._enteredDepth = depth;
	}

	public unmatch(): void {
		this._enteredDepth = null;
	}
}

export const enum EToCacheNodeProps {
	None = 0, // Cache none
	Name = 1 << 0, // Cache local and prefix <prefix:local
	Attributes = 1 << 1, // Cache attributes <prefix:local attribute="x"
	Text = 1 << 2 // Cache text content <prefix:local attribute="x">text
}

export const enum ETokenMatchCriteria {
	None = 0, // Match none
	Name = 1 << 0, // Match local and prefix <prefix:local
	Attributes = 1 << 1, // Match attributes <prefix:local attribute="x"
	Text = 1 << 2, // Match text content <prefix:local attribute="x">text
	Node = 1 << 3 // Match node
}
