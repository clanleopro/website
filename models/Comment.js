class Comment {
    constructor({
        id,
        userId,
        postId,
        text,
        parentId = null,
        createdAt,
        user = null
    }) {
        this.id = id;
        this.userId = userId;
        this.postId = postId;
        this.text = text;
        this.parentId = parentId;
        this.createdAt = createdAt ? new Date(createdAt) : null;
        this.user = user ? new User(user) : null;
    }

    static fromJson(json) {
        if (!json) return null;
        return new Comment(json);
    }
}