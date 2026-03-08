import { relations } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const movie = pgTable('movie', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const movieRelations = relations(movie, ({ one }) => ({
	user: one(user, {
		fields: [movie.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
