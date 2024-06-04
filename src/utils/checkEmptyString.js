const checkEmptyString = (str) => {
    return str?.trim() === '' ? null : str;
  };

  export default checkEmptyString;