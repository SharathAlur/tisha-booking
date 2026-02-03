export const stringToTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };