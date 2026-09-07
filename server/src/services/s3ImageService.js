const {
  S3Client,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getImageUrl = async (s3Key, expiresIn = 3600) => {
  if (!s3Key) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(s3, command, {
    expiresIn,
  });
};

module.exports = {
  getImageUrl,
};