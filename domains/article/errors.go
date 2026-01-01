package article

import "errors"

var ErrArticleNotFound = errors.New("article not found")
var ErrUnauthorized = errors.New("unauthorized: you are not the author of this article")
