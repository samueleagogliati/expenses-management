import Category from "../models/category.js"

export default {
  async list() {
    return await Category.query()
  }
}
