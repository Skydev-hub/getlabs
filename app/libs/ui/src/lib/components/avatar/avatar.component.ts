import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../models/user";

export enum AvatarType {
  Blank = "blank",
  Initials = "initials",
  Avatar = "avatar",
  Shadow = "shadow"
}

@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"],
  host: {
    "[class.size-xsmall]": "size === \"xsmall\"",
    "[class.size-small]": "size === \"small\"",
    "[class.size-large]": "size === \"large\"",
    "[class.size-xlarge]": "size === \"xlarge\"",
    "[class.no-ring]": "!ring"
  }
})
export class AvatarComponent implements OnInit {

  @Input()
  user: User;

  @Input()
  size: "xsmall" | "small" | "medium" | "large" | "xlarge";

  @Input()
  ring = true;

  @Input()
  initials = false;

  @Input()
  avatarType: AvatarType;

  AvatarType = AvatarType;

  constructor() { }

  ngOnInit() {}

  getAvatarType(): AvatarType {
    /* If the consumer has a specific avatar type, use that particular avatar so long as the requirements are in place... */
    if (this.avatarType && (this.user || (this.avatarType !== AvatarType.Initials && this.avatarType !== AvatarType.Avatar))) {
      return this.avatarType;
    }

    if (!this.user) {
      return AvatarType.Blank;
    }

    if (this.user.avatar) {
      return AvatarType.Avatar;
    }

    return this.initials && this.user.name ? AvatarType.Initials : AvatarType.Blank;
  }

  showBlankAvatar(): boolean {
    return !this.user || (this.user && (!this.user.name && !this.initials));
  }

  showInitials(): boolean {
    return this.user && this.user.name && this.initials;
  }

  showAvatar(): boolean {
    return this.user && !!this.user.avatar;
  }

}
