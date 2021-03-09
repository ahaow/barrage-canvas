import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript"
import pkg from "./package.json"
import { terser } from "rollup-plugin-terser"

export default [
    {
        input: "src/index.ts",
        output: {
            name: "howLongUntilLunch",
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
            terser({ compress: { drop_console: true } })
        ]
    },
    {
        input: "src/index.ts",
        external: ["ms"],
        plugins: [
            typescript()
        ],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ]
    }

]