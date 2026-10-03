import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** React hooks 名称清单，用于禁止从 react-dom* 误导入 */
const REACT_HOOKS = [
  "useState", "useEffect", "useMemo", "useCallback", "useRef", "useReducer",
  "useContext", "useLayoutEffect", "useImperativeHandle", "useDebugValue",
  "useId", "useDeferredValue", "useTransition", "useSyncExternalStore",
  "useInsertionEffect",
];

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "node_modules/", "*.mjs"],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // 防回归：React hooks 只能从 "react" 导入。
      // react-dom / react-dom/client 不导出 hooks，误导入会导致运行时白屏
      // （报错形如 "X.useState is not a function"），且打包阶段不报错。
      "no-restricted-imports": ["error", {
        paths: [
          {
            name: "react-dom",
            importNames: REACT_HOOKS,
            message: 'React hooks 必须从 "react" 导入（react-dom 不导出 hooks）。',
          },
          {
            name: "react-dom/client",
            importNames: REACT_HOOKS,
            message: 'React hooks 必须从 "react" 导入；react-dom/client 只提供 createRoot / hydrateRoot。',
          },
        ],
      }],
    },
  },
);
