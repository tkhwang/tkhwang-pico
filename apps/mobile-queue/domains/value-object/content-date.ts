export class ContentDate {
  private readonly value: Date;

  constructor(input: Date | string) {
    const parsed = input instanceof Date ? new Date(input.getTime()) : new Date(input);

    if (Number.isNaN(parsed.getTime())) throw new Error('Invalid date value');

    this.value = parsed;
  }

  /*
   *  Date
   */
  toDate(): Date {
    return new Date(this.value.getTime());
  }

  /*
   *  String
   */
  toSimpleString(locale = 'en'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(this.value);
  }

  toFullString(locale = 'en'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(this.value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
