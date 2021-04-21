
const extractComponentsFromUniqueName = (uniqueName: string): { dimension: string, hierarchy: string, member: string } => {
  const separator = '].[';

  let components = uniqueName.split(separator);

  const dimension = components.shift().substring(1);
  let hierarchy: string;
  let member: string;

  if (components.length === 1) {
    hierarchy = dimension;
  } else {
    hierarchy = components.shift();
  }

  member = components[0].substring(0, components[0].length - 1);

  return {
    dimension,
    hierarchy,
    member
  }
}

export { 
  extractComponentsFromUniqueName
}