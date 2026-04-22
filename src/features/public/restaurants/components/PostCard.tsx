import { memo } from "react"
import {
    Bookmark,
    Check,
    Ellipsis,
    Heart,
    MapPin,
    MessageCircle,
    Share2,
    Star,
} from "lucide-react"

import AppImage from "@/components/AppImage"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { FeedPost } from "../types"

interface PostCardProps {
    post: FeedPost
    onLike: (postId: string) => void
    onBookmark: (postId: string) => void
}

function getImageContainerClass(totalImages: number, index: number): string {
    const spanClass = totalImages === 3 && index === 0 ? "col-span-2" : ""
    const heightClass = totalImages === 1 ? "h-[400px]" : "h-64"
    return `relative overflow-hidden ${spanClass} ${heightClass}`
}

function PostCardComponent({ post, onLike, onBookmark }: PostCardProps) {
    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:bg-accent/15">
            <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="relative shrink-0">
                            <AppImage
                                src={post.restaurant.avatar}
                                alt={post.restaurant.name}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                                loading="lazy"
                            />
                            {post.restaurant.verified && (
                                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 ring-2 ring-background">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-foreground">{post.restaurant.name}</h3>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{post.timestamp}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3 text-red-500" />
                                    {post.restaurant.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Hành động bài viết"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <Ellipsis className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border bg-popover">
                            <DropdownMenuItem
                                className="cursor-pointer px-4 py-2 text-sm text-foreground"
                                onSelect={() => onBookmark(post.id)}
                            >
                                <Bookmark className="mr-2 h-4 w-4" />
                                <span>{post.bookmarked ? "Bỏ lưu" : "Lưu bài viết"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <p className="mb-3 leading-relaxed text-foreground/90">{post.content}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags?.map((tag, index) => (
                        <span
                            key={`${post.id}-${tag}-${index}`}
                            className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {post.promotion && (
                    <div className="mb-4 rounded-2xl border-2 border-primary/60 bg-background p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">KHUYẾN MÃI</p>
                                <p className="text-2xl font-bold text-foreground">{post.promotion.discount} OFF</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Có hiệu lực đến</p>
                                <p className="text-sm font-semibold text-foreground">{post.promotion.validUntil}</p>
                            </div>
                        </div>
                    </div>
                )}

                {post.event && (
                    <div className="mb-4 rounded-2xl border-2 border-primary/60 bg-background p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Giá</p>
                                <p className="text-lg font-bold text-foreground">{post.event.price}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Thời gian</p>
                                <p className="text-sm font-semibold text-foreground">{post.event.time}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Đặc biệt</p>
                                <p className="text-sm font-semibold text-foreground">{post.event.special}</p>
                            </div>
                        </div>
                    </div>
                )}

                {post.customerFeedback && (
                    <div className="mb-4 rounded-2xl border border-border bg-background p-4">
                        <div className="flex items-start space-x-3">
                            <AppImage
                                src={post.customerFeedback.avatar}
                                alt={post.customerFeedback.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                loading="lazy"
                            />
                            <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-foreground">{post.customerFeedback.name}</p>
                                    <div className="flex items-center space-x-0.5">
                                        {Array.from({ length: post.customerFeedback.rating }).map((_, index) => (
                                            <Star key={index} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/85 italic">
                                    "{post.customerFeedback.comment}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {post.images && post.images.length > 0 && (
                <div className={`grid ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-1`}>
                    {post.images.slice(0, 4).map((image, index) => (
                        <div key={`${post.id}-image-${index}`} className={getImageContainerClass(post.images?.length ?? 0, index)}>
                            <AppImage
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="h-full w-full cursor-pointer object-cover transition-transform duration-500 hover:scale-105"
                                loading="lazy"
                            />
                            {index === 3 && post.images.length > 4 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <span className="text-3xl font-bold text-white">+{post.images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="border-t border-border px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1.5 font-medium">
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            <span>{post.likes.toLocaleString()}</span>
                        </span>
                        <span>{post.comments} bình luận</span>
                    </div>
                    <span>{post.shares} chia sẻ</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onLike(post.id)}
                        className={`flex flex-1 items-center justify-center space-x-2 rounded-2xl border px-4 py-2.5 font-medium transition-all duration-200 ${post.liked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-secondary"
                            }`}
                    >
                        <Heart className={`h-5 w-5 ${post.liked ? "fill-primary-foreground text-primary-foreground" : "text-foreground"}`} />
                        <span className="text-sm">Thích</span>
                    </button>

                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center space-x-2 rounded-2xl border border-border bg-background px-4 py-2.5 font-medium text-foreground transition-all duration-200 hover:bg-secondary"
                    >
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Bình luận</span>
                    </button>

                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center space-x-2 rounded-2xl border border-border bg-background px-4 py-2.5 font-medium text-foreground transition-all duration-200 hover:bg-secondary"
                    >
                        <Share2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>
        </article>
    )
}

export default memo(PostCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.post === nextProps.post &&
        prevProps.onLike === nextProps.onLike &&
        prevProps.onBookmark === nextProps.onBookmark
    )
})
