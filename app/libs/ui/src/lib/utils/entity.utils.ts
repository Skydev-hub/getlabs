export const compareEntities = (entity1: { id?: string }, entity2: { id?: string }) => {
  return entity1 && entity2 && entity1.id === entity2.id && entity1.constructor === entity2.constructor;
};

export const getEntityIdentifier = (entity: {id?: string}) => {
  return entity && entity.id ? entity.id : null;
};
