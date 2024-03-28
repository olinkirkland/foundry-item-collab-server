import { Item, ItemModel } from './models/item';
import { UserModel } from './models/user';

export async function processFoundryActor(actor: any) {
  // Get the name from the foundryFile
  if (actor.type !== 'character') throw new Error('Not a character');
  const name = actor.name;
  if (await UserModel.exists({ name })) throw new Error('User already exists');
  await UserModel.create({ name, isGM: false });

  // Process the items
  const excludedItemTypes = [
    'ancestry',
    'heritage',
    'background',
    'class',
    'feat',
    'lore',
    'action'
  ];
  const currencySlugs = [
    'platinum-pieces',
    'gold-pieces',
    'silver-pieces',
    'copper-pieces'
  ];
  for (const foundryItem of actor.items as any[]) {
    if (excludedItemTypes.includes(foundryItem.type)) continue;

    const item: Item = {
      id: foundryItem._id,
      type: foundryItem.type,
      owner: name,
      name: foundryItem.name,
      description: foundryItem.system.description.value,
      level: foundryItem.system.level.value,
      price: flattenPrice(foundryItem.system.price.value),
      quantity: foundryItem.system.quantity,
      bulk: currencySlugs.includes(foundryItem.slug)
        ? 0
        : foundryItem.system.bulk.value,
      flaggedForSale: false,
      flaggedForPersonal: currencySlugs.includes(foundryItem.slug) // Currency is always personal by default
    };

    await ItemModel.create(item);
  }
}

// { pp: 0, gp: 0, sp: 0, cp: 0 }
// Add them up where pp = 10, gp = 1, sp = 0.1, cp = 0.01
function flattenPrice(price: {
  pp?: number;
  gp?: number;
  sp?: number;
  cp?: number;
}): number {
  let flat = 0;
  if (price.pp) flat += price.pp * 10;
  if (price.gp) flat += price.gp;
  if (price.sp) flat += price.sp / 10;
  if (price.cp) flat += price.cp / 100;
  return flat;
}
