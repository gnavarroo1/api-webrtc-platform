import { AggregateRoot } from '@nestjs/cqrs';

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _username: string,
    private _email: string,
    private _firstname: string,
    private _lastname: string,
    private _salt: string,
    private _hash: string,
  ) {
    super();
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get firstname(): string {
    return this._firstname;
  }

  get lastname(): string {
    return this._lastname;
  }

  get salt(): string {
    return this._salt;
  }

  get hash(): string {
    return this._hash;
  }
}
