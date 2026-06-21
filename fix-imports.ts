import { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  root.find(j.ImportDeclaration).forEach(path => {
     if (typeof path.node.source.value === 'string' && path.node.source.value.includes('components/shared/')) {
         if (path.node.source.value.startsWith('../components') && file.path.split('/').length === 4) {
             path.node.source.value = path.node.source.value.replace('../components', '../../components');
             hasModifications = true;
         }
         else if (path.node.source.value.startsWith('../../components') && file.path.split('/').length === 5) {
             path.node.source.value = path.node.source.value.replace('../../components', '../../../components');
             hasModifications = true;
         }
     }
  });

  return hasModifications ? root.toSource() : null;
}
