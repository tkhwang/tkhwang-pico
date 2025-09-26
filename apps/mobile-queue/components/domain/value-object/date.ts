export class ContentDate {
  private readonly value: Date;

  constructor(input: Date | string) {
    const parsed = input instanceof Date ? new Date(input.getTime()) : new Date(input);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date value');
    }

    this.value = parsed;
  }
}
