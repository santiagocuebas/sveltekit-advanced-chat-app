export const setUppercaseFirstLetter = (value: string) => {
  const firstLetter = value.at(0) as string;
  return value.replace(value.at(0) as string, firstLetter.toUpperCase());
};

export const setType = (name: string) => {
  if (name === 'username' || name === 'email') return 'text';
  return 'password';
};

export const getId = () => {
  const validChar = '0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ';
  let id = '';

  for (let i = 0; i < 16; i++) {
    id += validChar.at(Math.floor(Math.random() * validChar.length));
  }

  return id;
};

export const getDate = (date: Date) => {
  const newDate = new Date();
  const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const result = newDate.getTime() - date.getTime();

  if (result < 1000 * 60 * 60 * 24) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  } else if (result < 1000 * 60 * 60 * 24 * (365.2422 / 12)) {
    return date.getDate() + ' ' + days[date.getDay()];
  }
  
  return months[date.getMonth()] + ' ' + date.getFullYear();
};
