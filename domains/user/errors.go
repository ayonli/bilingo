package user

import (
	e "errors"
)

var (
	ErrUserNotFound   = e.New("user not found")
	ErrAuthorNotFound = e.New("author not found")
	ErrNotAnEmail     = e.New("not an email")
)
