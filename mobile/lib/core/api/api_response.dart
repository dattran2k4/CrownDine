typedef JsonParser<T> = T Function(Object? json);
typedef JsonWriter<T> = Object? Function(T value);

class ApiResponse<T> {
  const ApiResponse({required this.status, required this.message, this.data});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, {
    JsonParser<T>? fromJsonT,
  }) {
    final rawData = json['data'];

    return ApiResponse<T>(
      status: (json['status'] as num?)?.toInt() ?? 0,
      message: json['message']?.toString() ?? '',
      data: rawData == null
          ? null
          : fromJsonT == null
          ? rawData as T
          : fromJsonT(rawData),
    );
  }

  final int status;
  final String message;
  final T? data;

  bool get isSuccess => status >= 200 && status < 300;

  Map<String, dynamic> toJson({JsonWriter<T>? toJsonT}) {
    return {
      'status': status,
      'message': message,
      if (data != null) 'data': toJsonT == null ? data : toJsonT(data as T),
    };
  }
}
