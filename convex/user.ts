import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },

  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("UserTable")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Insert new user
    const userId = await ctx.db.insert("UserTable", {
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
    });

    return await ctx.db.get(userId);
  },
});