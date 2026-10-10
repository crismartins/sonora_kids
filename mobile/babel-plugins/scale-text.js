/**
 * Routes app Text and TextInput through ScaledText so the font-size
 * setting reaches every screen, not only the PEC labels.
 */
module.exports = function scaleTextPlugin({ types: t }) {
  return {
    name: "sonora-scale-text",
    visitor: {
      ImportDeclaration(path, state) {
        const filename = state.filename || "";
        if (filename.includes("ScaledText.tsx") || filename.includes("node_modules")) return;
        if (path.node.source.value !== "react-native") return;

        const textLocals = [];
        const inputLocals = [];
        const kept = [];

        for (const spec of path.node.specifiers) {
          if (
            spec.type === "ImportSpecifier" &&
            spec.importKind !== "type" &&
            spec.imported.type === "Identifier"
          ) {
            if (spec.imported.name === "Text") {
              textLocals.push(spec.local.name);
              continue;
            }
            if (spec.imported.name === "TextInput") {
              inputLocals.push(spec.local.name);
              continue;
            }
          }
          kept.push(spec);
        }

        if (textLocals.length === 0 && inputLocals.length === 0) return;

        const scaled = t.importDeclaration(
          [
            ...textLocals.map((name) =>
              t.importSpecifier(t.identifier(name), t.identifier("ScaledText")),
            ),
            ...inputLocals.map((name) =>
              t.importSpecifier(t.identifier(name), t.identifier("ScaledTextInput")),
            ),
          ],
          t.stringLiteral("@/components/ScaledText"),
        );

        if (kept.length === 0) {
          path.replaceWith(scaled);
          return;
        }

        path.node.specifiers = kept;
        path.insertAfter(scaled);
      },
    },
  };
};
