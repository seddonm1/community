<h1 align="center">
    <img src="https://raw.githubusercontent.com/builder-group/monorepo/develop/packages/xml-tokenizer/.github/banner.svg" alt="xml-tokenizer banner">
</h1>

<p align="left">
    <a href="https://github.com/builder-group/monorepo/blob/develop/LICENSE">
        <img src="https://img.shields.io/github/license/builder-group/monorepo.svg?label=license&style=flat&colorA=293140&colorB=FDE200" alt="GitHub License"/>
    </a>
    <a href="https://www.npmjs.com/package/xml-tokenizer">
        <img src="https://img.shields.io/bundlephobia/minzip/xml-tokenizer.svg?label=minzipped%20size&style=flat&colorA=293140&colorB=FDE200" alt="NPM bundle minzipped size"/>
    </a>
    <a href="https://www.npmjs.com/package/xml-tokenizer">
        <img src="https://img.shields.io/npm/dt/xml-tokenizer.svg?label=downloads&style=flat&colorA=293140&colorB=FDE200" alt="NPM total downloads"/>
    </a>
    <a href="https://discord.gg/w4xE3bSjhQ">
        <img src="https://img.shields.io/discord/795291052897992724.svg?label=&logo=discord&logoColor=000000&color=293140&labelColor=FDE200" alt="Join Discord"/>
    </a>
</p>

> Status: Experimental

`xml-tokenizer` is a straightforward and typesafe XML tokenizer that streams tokens through a callback mechanism.
The implementation is based on the [roxmltree](https://github.com/RazrFalcon/roxmltree) [`tokenizer.rs`](https://github.com/RazrFalcon/roxmltree/blob/master/src/tokenizer.rs). See the [FAQ](#-faq) why we did not embed the [roxmltree](https://github.com/RazrFalcon/roxmltree) crate as WASM.

- **XML Token Stream**: Processes XML documents as a stream, emitting tokens on the fly similar to the [`SAX`](https://www.baeldung.com/java-sax-parser) approach
- **Wide Range of Tokens**: Handles processing instructions, comments, entity declarations, element starts/ends, attributes, text, and CDATA sections
- **Validate XML**: Validates XML while processing which makes it slower than [`txml`](https://github.com/TobiasNickel/tXml) but its still twice as fast as [`fast-xml-parser`](https://github.com/NaturalIntelligence/fast-xml-parser)
- **Typesafe**: Build with TypeScript for strong type safety

### 📚 Examples

- [Vanilla Profiler](https://github.com/builder-group/monorepo/tree/develop/examples/xml-tokenizer/vanilla/playground)

### 🌟 Motivation

Create a typesafe, straightforward, and lightweight [XML](https://de.wikipedia.org/wiki/Extensible_Markup_Language) parser. Many existing parsers either lack TypeScript support, aren't actively maintained, or exceed 20kB gzipped.

My goal was to develop an efficient & flexible alternative by porting [roxmltree](https://github.com/RazrFalcon/roxmltree) to TypeScript or integrating it via WASM. While it functions well and is quite versatile due to its streaming approach, it's not as fast as I hoped.

### ⚖️ Alternatives

- [txml](https://github.com/TobiasNickel/tXml)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [saxen](https://github.com/nikku/saxen)

## 📖 Usage

```ts
import { select, tokenize, xmlToObject, xmlToSimplifiedObject } from 'xml-tokenizer';

// Parse XML to Javascript object without information lost (uses `tokenize` under the hood)
const xmlObject = xmlToObject('<p>Hello World</p>');

// Or, parse XML to easy to queryable Javascript object
const simplifiedXmlObject = xmlToSimplifiedObject('<p>Hello World</p>');

// Or, parse XML to a stream of tokens
tokenize('<p>Hello World</p>', (token) => {
	switch (token.type) {
		case 'ElementStart':
			console.log('Start of element:', token);
			break;
		case 'Text':
			console.log('Text content:', token.text);
			break;
		// Handle other token types as needed
		default:
			console.log('Token:', token);
	}
});

// Or, stream only a selection of tokens
select(
	xml,
	[
		[
			{ axis: 'child', local: 'bookstore' },
			{ axis: 'child', local: 'book', attributes: [{ local: 'category', value: 'COOKING' }] }
		]
	],
	(selectedToken) => {
		// Handle selected token
	}
);
```

### Token Types

The following token types are supported:

- **ProcessingInstruction**: `<?target content?>`
- **Comment**: `<!-- text -->`
- **EntityDeclaration**: `<!ENTITY ns_extend "http://test.com">`
- **ElementStart**: `<ns:elem`
- **Attribute**: `ns:attr="value"`
- **ElementEnd**:
  - Open: `>`
  - Close: `</ns:name>`
  - Empty: `/>`
- **Text**: Text content between elements, including whitespace.
- **Cdata**: `<![CDATA[text]]>`

## 👀 Differences from [XML 1.0 Specification](https://www.w3.org/TR/xml/)

- **Attribute Value Handling:**
  - **XML 1.0:** Attributes must be explicitly assigned a value in the format `Name="Value"`. An attribute without a value is not valid XML.
  - **Parser Behavior:** Attributes without an explicit value are interpreted as `true` (e.g., `<element attribute/>` is parsed as `attribute="true"`).
  - **Reason**: This behavior aligns with HTML-style parsing, which was necessary to handle HTML attributes without explicit values.

## 🚀 Benchmark

The performance of `xml-tokenizer` was benchmarked against other popular XML parsers. These tests focus on XML to object conversion and node counting. Interestingly, the version of `xml-tokenizer` imported directly from npm performed significantly better. The reason for this discrepancy is unclear, but the results seem accurate based on external testing.

### XML to Object Conversion

| Parser               | Operations per Second (ops/sec) | Min Time (ms) | Max Time (ms) | Mean Time (ms) | Relative Margin of Error (rme) |
| -------------------- | ------------------------------- | ------------- | ------------- | -------------- | ------------------------------ |
| xml-tokenizer        | 46.87                           | 19.47         | 24.57         | 21.33          | ±2.06%                         |
| xml-tokenizer (dist) | 53.70                           | 17.31         | 25.20         | 18.62          | ±3.28%                         |
| xml-tokenizer (npm)  | 163.00                          | 5.03          | 8.50          | 6.13           | ±2.32%                         |
| fast-xml-parser      | 66.00                           | 14.01         | 20.73         | 15.15          | ±3.34%                         |
| txml                 | 234.52                          | 3.38          | 7.61          | 4.26           | ±4.00%                         |
| xml2js               | 36.21                           | 25.58         | 37.28         | 27.61          | ±4.39%                         |

### Node Counting

| Parser              | Operations per Second (ops/sec) | Min Time (ms) | Max Time (ms) | Mean Time (ms) | Relative Margin of Error (rme) |
| ------------------- | ------------------------------- | ------------- | ------------- | -------------- | ------------------------------ |
| xml-tokenizer       | 53.03                           | 18.30         | 19.45         | 18.86          | ±0.81%                         |
| xml-tokenizer (npm) | 166.61                          | 5.62          | 7.16          | 6.00           | ±0.88%                         |
| saxen               | 500.99                          | 1.83          | 4.79          | 2.00           | ±1.52%                         |
| sax                 | 64.44                           | 14.96         | 16.34         | 15.52          | ±0.67%                         |

### Running the Benchmarks

The benchmarks can be found in the [`__tests__`](https://github.com/builder-group/community/tree/develop/packages/xml-tokenizer/src/__tests__) directory and can be executed by running:

```bash
pnpm run bench
```

## ❓ FAQ

### Why removed Rust implementation (WASM)?

We removed the Rust implementation to improve maintainability and because it didn't provide the expected performance boost.

Calling a TypeScript function from Rust on every token event (`wasmMix` benchmark) results in slow communication, negating Rust's performance benefits. Parsing XML entirely on the Rust site (`wasm` benchmark) avoids frequent communication but is still too slow due to the overhead of serializing and deserializing data between JavaScript and Rust (mainly the resulting XML-Object). While Rust parsing without returning results is faster than any JavaScript XML parser, needing results in the JavaScript layer makes this approach impractical.

The `roxmltree` package with the Rust implementation can be found in the `_deprecated` folder ([`packages/_deprecated/roxmltree_wasm`](https://github.com/builder-group/community/tree/develop/packages/_deprecated/roxmltree_wasm)).

| Parser            | Operations per Second (ops/sec) | Min Time (ms) | Max Time (ms) | Mean Time (ms) | Relative Margin of Error (rme) |
| ----------------- | ------------------------------- | ------------- | ------------- | -------------- | ------------------------------ |
| roxmltree:text    | 67.12                           | 14.33         | 83.29         | 80.08          | ±1.27%                         |
| roxmltree:wasmMix | 28.17                           | 34.83         | 36.71         | 35.49          | ±0.91%                         |
| roxmltree:wasm    | 109.30                          | 8.30          | 13.16         | 9.15           | ±3.31%                         |

### Why ported `tokenizer.rs` to TypeScript?

We ported [`tokenizer.rs`](https://github.com/RazrFalcon/roxmltree/blob/master/src/tokenizer.rs) to TypeScript because frequent communication between Rust and TypeScript negated Rust's performance benefits. The stream architecture required constant interaction between Rust and TypeScript via the `tokenCallback`, reducing overall efficiency.

### Why removed Byte-Based implementation?

We removed the byte-based implementation to enhance maintainability and because it didn't provide the expected performance improvement.

Decoding `Uint8Array` snippets to JavaScript strings is frequently necessary, nearly on every token event. This decoding process is slow, making this approach less efficient than working directly with strings.

| Parser         | Operations per Second (ops/sec) | Min Time (ms) | Max Time (ms) | Mean Time (ms) | Relative Margin of Error (rme) |
| -------------- | ------------------------------- | ------------- | ------------- | -------------- | ------------------------------ |
| roxmltree:text | 67.12                           | 14.33         | 83.29         | 80.08          | ±1.27%                         |
| roxmltree:byte | 12.48                           | 78.65         | 16.45         | 14.90          | ±1.15%                         |

The `roxmltree` package with the Byte-Based implementation can be found in the `_deprecated` folder ([`packages/_deprecated/roxmltree_byte-only`](https://github.com/builder-group/community/tree/develop/packages/_deprecated/roxmltree_byte-only)).

### Why not use a Generator?

While generators can improve developer experience, they introduce significant performance overhead. Our benchmarks show that using a generator dramatically increases the execution time compared to the callback approach. Given our focus on performance, we chose to maintain the callback implementation.

See [Generator vs Iterator vs Callback](https://observablehq.com/@domoritz/yield-vs-iterator-vs-callback) for more details.

#### Benchmark with Generator

```
[xml-tokenizer] Total Time: 5345.0000 ms | Average Time per Run: 53.4500 ms | Median Time: 53.0000 ms | Runs: 100
[txml] Total Time: 395.0000 ms | Average Time per Run: 3.9500 ms | Median Time: 4.0000 ms | Runs: 100
[fast-xml-parser] Total Time: 1290.0000 ms | Average Time per Run: 12.9000 ms | Median Time: 13.0000 ms | Runs: 100
```

#### Benchmark with Callback

```
[xml-tokenizer] Total Time: 662.0000 ms | Average Time per Run: 6.6200 ms | Median Time: 6.0000 ms | Runs: 100
[txml] Total Time: 394.0000 ms | Average Time per Run: 3.9400 ms | Median Time: 4.0000 ms | Runs: 100
[fast-xml-parser] Total Time: 1308.0000 ms | Average Time per Run: 13.0800 ms | Median Time: 13.0000 ms | Runs: 100
```

[Benchmark implementation in Vanilla Profiler](https://github.com/builder-group/monorepo/tree/develop/examples/xml-tokenizer/vanilla/playground)

## 💡 Resources

- [How I developed the fastest XML parser](https://tnickel.de/2020/08/30/2020-08-how-the-fastest-xml-parser-is-build/)
- [txml](https://github.com/TobiasNickel/tXml)
- [roxmltree](https://github.com/RazrFalcon/roxmltree)
