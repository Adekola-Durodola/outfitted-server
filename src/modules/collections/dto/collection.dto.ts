import { UserDto } from "src/modules/user/dto/user.dto";
import { Collection } from "../entities/collection.entity";
import { BookmarkDto } from "src/modules/bookmarks/bookmarks.dto";
import { User } from "src/modules/user/entities/user.entity";

export class CollectionDto {
    id: string;
    name: string;
    userId: string;
    user: UserDto;
    bookmarks: BookmarkDto[];
    createdAt: Date;
    updatedAt: Date;

    constructor(collection: Collection) {
        this.id = collection.id;
        this.name = collection.name;
        this.userId = collection.userId;
        this.createdAt = collection.createdAt;
        this.updatedAt = collection.updatedAt;
        this.user = new UserDto(collection.user as User & { id: number });
        this.bookmarks = collection.bookmarks.map(bookmark => new BookmarkDto(bookmark));
    }
}