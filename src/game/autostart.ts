export const shouldAutoStart = (search: string) => {
  if (!search) return false;
  const params = new URLSearchParams(search);
  const value = params.get("autostart");
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};
