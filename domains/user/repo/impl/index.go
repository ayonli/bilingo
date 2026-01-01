package impl

import "github.com/ayonli/bilingo/domains/user/repo"

var UserRepo repo.UserRepo = &userRepoDb{}
