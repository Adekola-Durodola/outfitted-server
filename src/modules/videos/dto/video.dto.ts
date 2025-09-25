import { UserDto } from "src/modules/user/dto/user.dto";
import { Video } from "../entities/video.entity";
import { User } from "src/modules/user/entities/user.entity";
import { BookmarkDto } from "src/modules/bookmarks/bookmarks.dto";

export class VideoDto {
    id: string;
    url: string;
    caption?: string;
    description?: string;
    bookmarks: BookmarkDto[];
    views: number;
    userId: string;
    user: UserDto;
    createdAt: Date;
    updatedAt: Date;

    constructor(video: Video) {
        this.id = video.id;
        this.url = video.url;
        this.caption = video.caption;
        this.description = video.description;
        this.views = video.views;
        this.userId = video.userId;
        this.createdAt = video.createdAt;
        this.updatedAt = video.updatedAt;
        this.user = new UserDto(video.user as User & { id: number });
        this.bookmarks = video.bookmarks.map(bookmark => new BookmarkDto(bookmark));
    }
}