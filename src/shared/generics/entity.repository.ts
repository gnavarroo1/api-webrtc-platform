import { AggregateRoot } from '@nestjs/cqrs';
import {
  _AllowStringsForIds,
  FilterQuery,
  LeanDocument,
  Model,
} from 'mongoose';

import { EntitySchemaFactory } from './entity-schema.factory';
import { IdentifiableEntitySchema } from './identifiable-entity.schema';
import { Result } from '../utils/functional-error-handler';

export abstract class EntityRepository<
  TSchema extends IdentifiableEntitySchema,
  TEntity extends AggregateRoot,
> {
  constructor(
    protected readonly entityModel: Model<TSchema>,
    protected readonly entitySchemaFactory: EntitySchemaFactory<
      TSchema,
      TEntity
    >,
  ) {}

  protected async findOne(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<Result<TEntity>> {
    const entityDocument = await this.entityModel.findOne(
      entityFilterQuery,
      {},
      { lean: true },
    );
    if (!entityDocument) {
      return Result.fail<TEntity>(`Couldn't find entry`);
    }
    const entity = this.entitySchemaFactory.createFromSchema(entityDocument);

    return Result.ok<TEntity>(entity);
  }

  protected async find(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEntity[]> {
    return (
      await this.entityModel.find(entityFilterQuery, {}, { lean: true })
    ).map((entityDocument) =>
      this.entitySchemaFactory.createFromSchema(entityDocument),
    );
  }

  async create(entity: TEntity): Promise<void> {
    await new this.entityModel(this.entitySchemaFactory.create(entity)).save();
  }

  protected async findOneAndReplace(
    entityFilterQuery: FilterQuery<TSchema>,
    entity: TEntity,
  ): Promise<Result<TSchema>> {
    try {
      const updatedEntityDocument = await this.entityModel.findOneAndReplace(
        entityFilterQuery,
        this.entitySchemaFactory.create(
          entity,
        ) as unknown as _AllowStringsForIds<LeanDocument<TSchema>>,
        {
          new: true,
          useFindAndModify: false,
          lean: true,
        },
      );
      if (!updatedEntityDocument) {
        return Result.fail<TSchema>('Unable to find the entity to replace.');
      }
      return Result.ok<TSchema>(updatedEntityDocument);
    } catch (e) {
      console.log(e);
    }
  }

  // protected async findOneAndUpdate(
  //   entityFilterQuery: FilterQuery<TSchema>,
  //   updateQuery: UpdateQuery<TSchema>,
  // ): Promise<void> {
  //   await this.entityModel.findOneAndUpdate(entityFilterQuery, updateQuery, {
  //
  //   });
  // }
}
