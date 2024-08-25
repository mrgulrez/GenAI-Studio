import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const BotAvatar = () => {
    return (
        <Avatar className="w-8 h-8">
            <AvatarImage src="/images/logo.png" />
            <AvatarFallback>
                B
            </AvatarFallback>
        </Avatar>
        
    )
}