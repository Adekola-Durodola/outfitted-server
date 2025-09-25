import { CollectionDto } from "../collections/dto/collection.dto";
import { Collection } from "../collections/entities/collection.entity";
import { UserDto } from "../user/dto/user.dto";
import { User } from "../user/entities/user.entity";
import { VideoDto } from "../videos/dto/video.dto";
import { Bookmark } from "./entities/bookmark.entity";

export class BookmarkDto {
    id: string;
    userId: string;
    user: UserDto;
    videoId: string;
    video: VideoDto;
    collectionId: string;
    collection: CollectionDto;
    createdAt: Date;
    updatedAt: Date;

    constructor(bookmark: Bookmark) {
        this.id = bookmark.id;
        this.userId = bookmark.userId;
        this.videoId = bookmark.videoId;
        this.video = new VideoDto(bookmark.video);
        this.collectionId = bookmark.collectionId;
        this.createdAt = bookmark.createdAt;
        this.updatedAt = bookmark.updatedAt;
        this.user = new UserDto(bookmark.user as User & { id: number });
        this.collection = new CollectionDto(bookmark.collection as Collection);
    }
}