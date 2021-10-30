import { AggregateRoot } from '@nestjs/cqrs';
import { IdentifiableEntitySchema } from './identifiable-entity.schema';
import { EntityRepository } from './entity.repository';
import { ObjectID } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { Result } from '../utils/functional-error-handler';

export abstract class BaseEntityRepository<
  TSchema extends IdentifiableEntitySchema,
  TEntity extends AggregateRoot,
> extends EntityRepository<TSchema, TEntity> {
  async findOneById(id: string): Promise<Result<TEntity>> {
    return this.findOne({ _id: new ObjectID(id) } as FilterQuery<TSchema>);
  }

  async findOneAndReplaceById(
    id: string,
    entity: TEntity,
  ): Promise<Result<TSchema>> {
    return this.findOneAndReplace(
      { _id: new ObjectID(id) } as FilterQuery<TSchema>,
      entity,
    );
  }

  async findAll(): Promise<TEntity[]> {
    return this.find({});
  }
  async findOneAttr(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<Result<TEntity>> {
    return this.findOne(entityFilterQuery);
  }

  async findOneAndReplaceByAttr(
    entityFilterQuery: FilterQuery<TSchema>,
    entity: TEntity,
  ): Promise<Result<TSchema>> {
    return this.findOneAndReplace(entityFilterQuery, entity);
  }
}
