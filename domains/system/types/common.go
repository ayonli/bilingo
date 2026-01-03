package types

type ObjectInfo struct {
	ObjectType string `json:"object_type" query:"object_type" validate:"required,max=16"`
	ObjectId   string `json:"object_id"  query:"object_id" validate:"required,max=64"`
}
