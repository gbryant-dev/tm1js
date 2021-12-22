
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

const removeSpacesAndLower = (str: string): string => {
  return str.replace(/\s/g, '').toLowerCase()
}

const caseAndSpaceInsensitiveEquals = (str1: string, str2: string): boolean => {
  return removeSpacesAndLower(str1) === removeSpacesAndLower(str2)
}

const fixedEncodeURIComponent = (str: string): string => {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

export { 
  extractComponentsFromUniqueName,
  removeSpacesAndLower,
  caseAndSpaceInsensitiveEquals,
  fixedEncodeURIComponent
}
