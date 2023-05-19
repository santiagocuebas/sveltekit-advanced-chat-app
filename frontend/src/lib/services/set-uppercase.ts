export const setUppercaseFirstLetter = (value: string) => {
  const firstLetter = value.at(0) as string;
  return value.replace(value.at(0) as string, firstLetter.toUpperCase());
};
