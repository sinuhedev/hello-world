FROM sinuhedev/base:latest
LABEL author="sinuhe.dev@gmail.com"

# install
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

# clean
RUN rm -r /tmp/tmp.*

CMD bash
