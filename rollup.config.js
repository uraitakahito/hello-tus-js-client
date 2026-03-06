import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "iife",
    sourcemap: true,
  },
  // NOTE: @rollup/plugin-typescript の load() フックの注意点
  //
  // このプラグインの load() フックは、内部の filter() 関数がファイルを
  // 対象外と判定した場合や、findTypescriptOutput() が emit 結果を
  // 見つけられなかった場合に null を返す。
  // Rollup は null を「このプラグインでは変換しない」と解釈し、
  // .ts ファイルを素の JavaScript としてパースしようとする。
  // その結果、TypeScript 構文（import type 等）で
  // "Expected ',', got '{'" のような無関係な構文エラーが発生する。
  //
  // このエラーメッセージからはプラグインがファイルをスキップしたことを
  // 読み取れないため、原因特定が困難になる。
  // 例えば dist/ に tsc の出力が残っている場合、filter() の outDir
  // 除外ロジックが意図せず src/ 側のファイルにも影響しうる。
  //
  // 同種の問題は GitHub 上で繰り返し報告されている:
  //   https://github.com/rollup/plugins/issues/287
  //   https://github.com/rollup/plugins/issues/849
  //   https://github.com/rollup/plugins/issues/1083
  //
  // 該当するプラグインのソースコード:
  //   https://github.com/rollup/plugins/blob/master/packages/typescript/src/index.ts
  //   (load() フック内の filter(id) チェックと output.code != null チェック)
  plugins: [resolve({ browser: true }), commonjs(), json(), typescript()],
};
