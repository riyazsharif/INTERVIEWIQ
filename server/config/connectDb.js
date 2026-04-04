import mongoose from "mongoose";


const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DataBase Connected!!");

    // Fix: Drop incorrect unique index on name field if it exists
    try {
      await User.collection.dropIndex("name_1");
      console.log("Dropped incorrect 'name_1' index");
    } catch (indexError) {
      // Index doesn't exist, which is fine
    }
  } catch (error) {
    console.log(`DataBase Error ${error}`);
  }
};

export default connectDb;
