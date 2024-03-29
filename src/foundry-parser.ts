import { Item, ItemModel } from './models/item';
import { UserModel } from './models/user';

export async function processFoundryActor(actor: any): Promise<any[]> {
  const errors: any[] = [];
  // Get the name from the foundryFile
  if (actor.type !== 'character') throw new Error('Not a character');
  const name = actor.name;
  if (await UserModel.exists({ name })) return ['User already exists'];
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

  for (const item of actor.items as any[]) {
    try {
      console.log(`Processing item: ${item.name} (${item.type})`);
      if (excludedItemTypes.includes(item.type)) continue;
      if (!item?.system?.price?.value) continue;
      const isCurrency = currencySlugs.includes(item.slug);

      const parsedItem: Item = {
        id: item._id,
        type: item.type,
        owner: name,
        name: item.name,
        description: item.system.description.value,
        level: item.system.level.value,
        price: flattenPrice(item.system.price.value),
        quantity: item.system.quantity,
        bulk: isCurrency ? 0 : item.system.bulk.value,
        flaggedForSale: false,
        flaggedForPersonal: isCurrency // Currency is always personal by default
      };

      await ItemModel.create(parsedItem);
    } catch (e) {
      errors.push(`Error processing item ${item.name} (${item.type})`);
    }
  }
  return errors;
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
