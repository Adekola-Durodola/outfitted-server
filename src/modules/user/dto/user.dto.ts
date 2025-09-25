import { VideoDto } from "src/modules/videos/dto/video.dto";
import { User } from "../entities/user.entity";
import { CollectionDto } from "src/modules/collections/dto/collection.dto";
import { BookmarkDto } from "src/modules/bookmarks/bookmarks.dto";

export class UserDto {
    id: any;
    email: string;
    userName?: string;
    name?: string;
    image?: string;
    bio?: string;
    tiktok?: string;
    dateOfBirth?: Date;
    region?: string;
    videos: VideoDto[];
    collections: CollectionDto[];
    bookmarks: BookmarkDto[];
    createdAt: Date;
    updatedAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.userName = user.userName;
        this.name = user.name;
        this.image = user.image;
        this.bio = user.bio;
        this.tiktok = user.tiktok;
        this.dateOfBirth = user.dateOfBirth;
        this.region = user.region;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.videos = user.videos?.map(video => new VideoDto(video)) || [];
        this.bookmarks = user.bookmarks?.map(bookmark => new BookmarkDto(bookmark)) || [];
        this.collections = user.collections?.map(collection => new CollectionDto(collection)) || [];
    }
}