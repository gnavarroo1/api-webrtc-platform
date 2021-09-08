import { AggregateRoot } from '@nestjs/cqrs';
import { IdentifiableEntitySchema } from './identifiable-entity.schema';
import { EntityRepository } from './entity.repository';
import { ObjectID } from 'mongodb';
import { FilterQuery } from 'mongoose';

export abstract class BaseEntityRepository<
  TSchema extends IdentifiableEntitySchema,
  TEntity extends AggregateRoot,
> extends EntityRepository<TSchema, TEntity> {
  async findOneById(id: string): Promise<TEntity> {
    return this.findOne({ _id: new ObjectID(id) } as FilterQuery<TSchema>);
  }

  async findOneAndReplaceById(id: string, entity: TEntity): Promise<TSchema> {
    return await this.findOneAndReplace(
      { _id: new ObjectID(id) } as FilterQuery<TSchema>,
      entity,
    );
  }

  async findAll(): Promise<TEntity[]> {
    return this.find({});
  }
  async findOneAttr(
    entityFilterQuery?: FilterQuery<TSchema>,
  ): Promise<TEntity> {
    return this.findOne(entityFilterQuery);
  }

  async findOneAndReplaceByAttr(
    entityFilterQuery: FilterQuery<TSchema>,
    entity: TEntity,
  ): Promise<TSchema> {
    return await this.findOneAndReplace(entityFilterQuery, entity);
  }
}
