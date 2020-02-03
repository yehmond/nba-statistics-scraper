import mongoose from 'mongoose';

// Create Schema
const TeamSchema = new mongoose.Schema({
    name: {type: String, required: true},
    id: {type: String, required: true}
});

// Create Model
export default mongoose.model('Team', TeamSchema);
