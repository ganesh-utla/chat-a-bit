const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    members: {
        type: Array
    }
});

const Conversations = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversations; 