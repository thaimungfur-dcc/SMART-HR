import { API, FileInfo, Options } from 'jscodeshift';
import path from 'path';

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;
  let addedImports = new Set<string>();

  // 1. Remove Local Components
  const componentsToRemove = ['KpiCard', 'LocalKpiCard', 'UserGuidePanel', 'Toast'];
  
  componentsToRemove.forEach(componentName => {
      // Find VariableDeclarations (e.g. const KpiCard = ...)
      const varDecls = root.find(j.VariableDeclarator, {
        id: { type: 'Identifier', name: componentName }
      });
      
      if (varDecls.size() > 0) {
          varDecls.closest(j.VariableDeclaration).remove();
          hasModifications = true;
      }
      
      // Find FunctionDeclarations (e.g. function UserGuidePanel(...) {...})
      const funcDecls = root.find(j.FunctionDeclaration, {
        id: { type: 'Identifier', name: componentName }
      });
      
      if (funcDecls.size() > 0) {
          funcDecls.remove();
          hasModifications = true;
      }
  });
  
  // 2. Replace <LocalKpiCard> with <KpiCard>
  root.find(j.JSXOpeningElement, { name: { type: 'JSXIdentifier', name: 'LocalKpiCard' } })
    .forEach(path => {
       path.node.name = j.jsxIdentifier('KpiCard');
       hasModifications = true;
    });
  root.find(j.JSXClosingElement, { name: { type: 'JSXIdentifier', name: 'LocalKpiCard' } })
    .forEach(path => {
       path.node.name = j.jsxIdentifier('KpiCard');
       hasModifications = true;
    });
    
  // 3. Fix KpiCard props (colorAccent -> color, desc -> description, remove colorValue)
  root.find(j.JSXOpeningElement, { name: { type: 'JSXIdentifier', name: 'KpiCard' } })
    .forEach(path => {
       let hasIconProp = false;
       path.node.attributes = path.node.attributes?.filter(attr => {
           if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
               if (attr.name.name === 'colorValue') return false; // remove
               if (attr.name.name === 'colorAccent') {
                   attr.name.name = 'color';
                   hasModifications = true;
               }
               if (attr.name.name === 'desc') {
                   attr.name.name = 'description';
                   hasModifications = true;
               }
               if (attr.name.name === 'icon') {
                   hasIconProp = true;
               }
           }
           return true;
       }) || [];
    });

  // 4. Determine needed imports based on JSX elements present
  const presentJSXElements = new Set<string>();
  root.find(j.JSXOpeningElement).forEach(path => {
      if (path.node.name.type === 'JSXIdentifier') {
          presentJSXElements.add(path.node.name.name);
      }
  });
  
  ['KpiCard', 'UserGuidePanel', 'Toast'].forEach(comp => {
      if (presentJSXElements.has(comp)) {
          addedImports.add(comp);
      }
  });

  if (addedImports.size > 0 && hasModifications) {
      // Find where to inject relative imports
      const depth = file.path.split('/').length - 3; // e.g. src/pages/Module/file.tsx -> depth 2 = ../../
      const relativePrefix = depth > 0 ? Array(depth).fill('..').join('/') + '/' : './';
      
      addedImports.forEach(comp => {
         // Check if already imported
         const existingImport = root.find(j.ImportDeclaration, {
             source: { value: `${relativePrefix}components/shared/${comp}` }
         });
         
         if (existingImport.size() === 0) {
             const importDecl = j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier(comp))],
                j.literal(`${relativePrefix}components/shared/${comp}`)
             );
             // Special case for UserGuidePanel and Toast: They were exported via const, maybe without default!
             // Let's use named imports for UserGuidePanel and Toast, default for KpiCard
             let specifier: any = j.importDefaultSpecifier(j.identifier(comp));
             if (comp === 'UserGuidePanel' || comp === 'Toast') {
                 specifier = j.importSpecifier(j.identifier(comp));
             }
             
             importDecl.specifiers = [specifier];
             
             root.find(j.ImportDeclaration).at(0).insertBefore(importDecl);
             hasModifications = true;
         }
      });
  }

  return hasModifications ? root.toSource() : null;
}
