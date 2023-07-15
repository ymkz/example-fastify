import { db } from '~/repositories'
import { Todo } from '~/repositories/schema/todos'

// TODO: 検索用に期間の絞り込みを実装する
export const findList = async (
  args: Partial<Pick<Todo, 'title' | 'status'>> & {
    limit?: number
    offset?: number
  },
) => {
  let query = db
    .selectFrom('todos')
    .selectAll()
    .where('todos.deleted_at', 'is', null)
    .limit(args.limit ?? 10)
    .offset(args.offset ?? 0)
    .orderBy('todos.created_at', 'desc')

  if (args.title) {
    query = query.where('todos.title', 'like', `%${args.title}%`)
  }
  if (args.status) {
    query = query.where('todos.status', '=', args.status)
  }

  const result = await query.execute()

  return result
}

export const findOneById = async (args: Pick<Todo, 'id'>) => {
  const result = await db
    .selectFrom('todos')
    .selectAll()
    .where('todos.id', '=', args.id)
    .where('todos.deleted_at', 'is', null)
    .limit(1)
    .executeTakeFirst()

  return result
}
