export function getDatabaseErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось подключиться к базе данных";
}
