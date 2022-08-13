---
categories: [""] 
tags: [""] 
title: "vue保存时上传图片"
# linkTitle: ""
weight: 5
description: >
  
---

## 前端代码

```javascript

<template>
    <div class="content">
        <el-form label-width="120px" :model="form" ref="form">
            <el-form-item label="图片">
                <el-upload
                        class="avatar-uploader"
                        ref="upload"
                        action="/dishResource/upload"
                        name="file"
                        :data="form"
                        :on-change="handleAvatarChange"
                        :on-success="handleAvatarSuccess"
                        :before-upload="beforeAvatarUpload"
                        :auto-upload="false"
                        :show-file-list="false">
                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>

            </el-form-item>
            <el-form-item label="图片类型">
                <el-radio-group v-model="form.imageType">
                    <el-radio label="0">小图</el-radio>
                    <el-radio label="1">大图</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="uploadImage('form')">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                dishId: "",
                imageUrl1: "",
                form: {
                    dishId: "",
                    imageType: "0"
                }
            }
        },
        props: ['dishId'],
        methods: {
            handleAvatarSuccess(res, file) {
                if (res.type == "SUCCESS") {
                    var parent = this;
                    this.$notify.success({
                        title: "提示",
                        message: "替换首图成功！",
                        duration: 2000,
                        offset: 0,
                        onClose: function () {
                            parent.imageUrl = res.extra.url;
                            parent.form.imageType = res.extra.status + "";
                        }
                    });
                }
            },
            handleAvatarChange(file, fileList) {
                if (fileList.length == 1) {
                    this.imageUrl = URL.createObjectURL(file.raw);
                }
            },
            beforeAvatarUpload(file) {
                this.form.dishId = this.dishId;

                const isImage = (file.type === 'image/jpeg' || file.type === 'image/png');
                const isLt5M = file.size / 1024 / 1024 < 5;

                if (!isImage) {
                    this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
                }
                if (!isLt5M) {
                    this.$message.error('上传头像图片大小不能超过 5MB!');
                }
                return isImage && isLt5M;
            },
            uploadImage(formName) {
                this.$refs.upload.submit();
            }
        },
        mounted: function () {
            this.$http.post('/dishResource', {
                "dishId": this.dishId,
            }, {emulateJSON: true}).then(response => {
                this.imageUrl = response.body.extra.url;
                this.form.imageType = response.body.extra.status + "";
            });
        }
    }
</script>

<style>
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 600px;
        height: 450px;
        line-height: 450px;
        text-align: center;
    }

    .avatar {
        width: 160px;
        height: 120px;
        display: block;
    }
</style>
```


## 后端代码

```java
    @OperationLog(source = SysPlatform.DISH_SPU)
    @RequestMapping("/upload")
    @ResponseBody
    public RequestResult<SkuDishResourceDto> uploadDefaultImage(@RequestParam("file") MultipartFile file, Long dishId, Integer imageType){

        if(file==null){
            return new RequestResult<>(ResultType.ERROR, "上传图片不能为空！");
        }

        if(dishId==null){
            return new RequestResult<>(ResultType.ERROR, "菜品ID不能为空！");
        }

        if(imageType==null){
            return new RequestResult<>(ResultType.ERROR, "图片类型不能为空！");
        }

        DishImageTypeEnum dishImageTypeEnum = DishImageTypeEnum.getByType(imageType);
        if(dishImageTypeEnum==null){
            return new RequestResult<>(ResultType.ERROR, "图片类型不合法！");
        }

        String url = "";
        try{
            ImageUploadClient client = new ImageUploadClientImpl(bucket, clientId, secret);
            ImageResult res = client.postImage(file.getBytes(), file.getName() ,true,false,null);
            url = res.getOriginalLink();
        }catch (Exception e){
            log.error("上传图片失败", e);
            return new RequestResult<>(ResultType.ERROR, "上传图片失败");
        }
        if(StringUtils.isEmpty(url)){
            return new RequestResult<>(ResultType.ERROR, "上传图片失败");
        }

        url = url.replaceAll("http://", "");
        skuDishResourceMngService.deleteByDishIdAndType(dishId, 1);

        SkuDishResourceDto skuDishResourceDto = new SkuDishResourceDto();
        skuDishResourceDto.setDishId(dishId);
        skuDishResourceDto.setUrl(url);
        skuDishResourceDto.setType(1);
        skuDishResourceDto.setResourceOrder(0);
        skuDishResourceDto.setStatus(imageType);

        EditorInfo editorInfo = new EditorInfo();
        User user = UserUtils.getUser();
        editorInfo.setEditorName(user.getName());

        skuDishResourceMngService.addSkuDishResource(skuDishResourceDto, editorInfo);

        com.dianping.poi.dish.api.dto.EditorInfo editorInfo1 = new com.dianping.poi.dish.api.dto.EditorInfo();
        editorInfo1.setEditorName(user.getName());
        skuDishReviewService.skuDishReviewed(Arrays.asList(dishId), editorInfo1);

        List<SkuDishResourceDto> list = skuDishResourceMngService.findSkuDishResourceDtoByDishIdAndType(dishId, 1);
        if(CollectionUtils.isEmpty(list)){
            return new RequestResult<>(ResultType.ERROR, "上传图片失败");
        }

        skuDishResourceDto = list.get(0);
        skuDishResourceDto.setUrl("http://" + skuDishResourceDto.getUrl());
        return new RequestResult<>(skuDishResourceDto);
    }

```
