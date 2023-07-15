import { sql } from 'kysely'
import { db } from '~/repositories'
import { Todo } from '~/repositories/schema/todos'

export const createOne = async (args: Pick<Todo, 'title'>) => {
  const result = await db
    .insertInto('todos')
    .values({ title: args.title })
    .returningAll()
    .executeTakeFirstOrThrow()

  return result
}

/**
 * @description 論理削除
 */
export const deleteOne = async (id: number) => {
  const result = await db
    .updateTable('todos')
    .set({ deleted_at: sql`DATETIME('now', 'localtime')` })
    .where('todos.id', '=', id)
    .returningAll()
    .executeTakeFirst()

  return result
}

export const updateOne = async (
  id: number,
  title?: Todo['title'],
  status?: Todo['status'],
) => {
  // 明示的にupdated_atを更新する（TRIGGERによるON_UPDATEではなくアプリケーション側が責務を持つ）
  const result = await db
    .updateTable('todos')
    .set({ title, status, updated_at: sql`DATETIME('now', 'localtime')` })
    .where('todos.id', '=', id)
    .where('todos.deleted_at', 'is', null)
    .returningAll()
    .executeTakeFirst() // idを条件指定しているため必ずひとつのみ更新されているはず

  return result
}
