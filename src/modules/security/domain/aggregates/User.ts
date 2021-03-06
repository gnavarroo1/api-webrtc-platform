import { AggregateRoot } from '@nestjs/cqrs';

export class User extends AggregateRoot {
  set username(value: string) {
    this._username = value;
  }

  set email(value: string) {
    this._email = value;
  }

  set firstname(value: string) {
    this._firstname = value;
  }

  set lastname(value: string) {
    this._lastname = value;
  }

  set salt(value: string) {
    this._salt = value;
  }

  set hash(value: string) {
    this._hash = value;
  }
  get verified(): boolean {
    return this._verified;
  }

  set verified(value: boolean) {
    this._verified = value;
  }
  constructor(
    private readonly _id: string,
    private _username: string,
    private _email: string,
    private _firstname: string,
    private _lastname: string,
    private _salt: string,
    private _hash: string,
    private _verified: boolean = false,
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
