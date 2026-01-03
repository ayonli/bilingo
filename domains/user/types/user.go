package types

import "github.com/ayonli/bilingo/common"

//tygo:emit import type * as common from "@/common"
type UserListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	Search                *string                `json:"search" query:"search"`
	Emails                *[]string              `json:"emails" query:"emails"`
	Birthdate             *common.Range[*string] `tstype:"common.Range<string>" json:"birthdate" query:"birthdate"`
}

type UserCreate struct {
	Email     string  `json:"email" form:"email"`
	Name      string  `json:"name" form:"name"`
	Password  string  `json:"password" form:"password"`
	Birthdate *string `json:"birthdate" form:"birthdate"`
}

type UserUpdate struct {
	Name      *string `json:"name" form:"name"`
	Password  *string `json:"password" form:"password"`
	Birthdate *string `json:"birthdate" form:"birthdate"`
}

type PasswordChange struct {
	OldPassword string `json:"old_password" form:"old_password"`
	NewPassword string `json:"new_password" form:"new_password"`
}

type LoginCredentials struct {
	Email    string `json:"email" form:"email"`
	Password string `json:"password" form:"password"`
}
